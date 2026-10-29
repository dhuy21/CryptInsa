resource "aws_vpc" "prod" {
  cidr_block           = "10.20.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "cryptinsa-prod"
  }
}

resource "aws_internet_gateway" "prod" {
  vpc_id = aws_vpc.prod.id

  tags = {
    Name = "cryptinsa-prod"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.prod.id
  cidr_block              = "10.20.1.0/24"
  availability_zone       = "eu-west-3a"
  map_public_ip_on_launch = false

  tags = {
    Name = "cryptinsa-prod-public"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.prod.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.prod.id
  }

  tags = {
    Name = "cryptinsa-prod-public"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

resource "aws_security_group" "origin" {
  name        = "cryptinsa-origin"
  description = "HTTPS from CloudFront only. Egress 443 for ECR, SSM, and package installs."
  vpc_id      = aws_vpc.prod.id

  ingress {
    description     = "HTTPS from CloudFront"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    prefix_list_ids = [data.aws_ec2_managed_prefix_list.cloudfront.id]
  }

  egress {
    description = "HTTPS to the internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "cryptinsa-origin"
  }
}
