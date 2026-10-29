# GitHub Actions on main assumes this role. No long-lived access key.
# main is the only production branch. Pull requests cannot assume it.

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["06d927fecd0a84aeba28aad1d808139470fe95c3"]
}

resource "aws_iam_role" "deploy" {
  name = "cryptinsa-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRoleWithWebIdentity"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          "token.actions.githubusercontent.com:sub" = "repo:dhuy21/CryptInsa:ref:refs/heads/main"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "deploy" {
  name = "cryptinsa-deploy"
  role = aws_iam_role.deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ListFrontend"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.frontend.arn
      },
      {
        Sid      = "WriteFrontend"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      },
      {
        Sid      = "InvalidateSite"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation"]
        Resource = aws_cloudfront_distribution.site.arn
      },
      {
        Sid      = "EcrAuth"
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Sid    = "PushImages"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:CompleteLayerUpload",
          "ecr:GetDownloadUrlForLayer",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart",
        ]
        Resource = [
          aws_ecr_repository.backend.arn,
          aws_ecr_repository.nginx.arn,
        ]
      },
      {
        Sid    = "PinImageDigests"
        Effect = "Allow"
        Action = ["ssm:PutParameter"]
        Resource = [
          "arn:aws:ssm:eu-west-3:557701609352:parameter/cryptinsa/prod/backend-image",
          "arn:aws:ssm:eu-west-3:557701609352:parameter/cryptinsa/prod/nginx-image",
        ]
      },
      {
        Sid    = "RestartOrigin"
        Effect = "Allow"
        Action = ["ssm:SendCommand"]
        Resource = [
          "arn:aws:ssm:eu-west-3::document/AWS-RunShellScript",
          "arn:aws:ec2:eu-west-3:557701609352:instance/i-03c299c48155f375d",
        ]
      },
      {
        Sid      = "ReadRestart"
        Effect   = "Allow"
        Action   = ["ssm:GetCommandInvocation"]
        Resource = "*"
      }
    ]
  })
}
