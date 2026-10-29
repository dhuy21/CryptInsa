data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-kernel-6.18-arm64"]
  }

  filter {
    name   = "architecture"
    values = ["arm64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_iam_role" "ec2" {
  name = "cryptinsa-ec2"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2" {
  name = "cryptinsa-ec2"
  role = aws_iam_role.ec2.name
}

resource "aws_instance" "origin" {
  ami           = data.aws_ami.al2023.id
  instance_type = "t4g.micro"
  subnet_id     = aws_subnet.public.id

  vpc_security_group_ids = [aws_security_group.origin.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  # Nothing else on this resource references the route, so Terraform may
  # boot the instance before the default route exists.
  depends_on = [aws_route_table_association.public]

  user_data = <<-EOT
    #!/bin/bash
    set -eux
    dnf install -y docker
    systemctl enable --now docker
  EOT

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_type = "gp3"
    volume_size = 15
    encrypted   = true
  }

  tags = {
    Name = "cryptinsa-prod"
  }

  # Attack state is in this process. A newer Amazon Linux AMI must not
  # replace the instance during an unrelated apply.
  lifecycle {
    ignore_changes = [ami]
  }
}

resource "aws_eip" "origin" {
  domain = "vpc"

  tags = {
    Name = "cryptinsa-prod"
  }
}

resource "aws_eip_association" "origin" {
  instance_id   = aws_instance.origin.id
  allocation_id = aws_eip.origin.id
}
