# Plan and apply use two roles. The app deploy role cannot change infrastructure.
# Plan may run on a pull request. Apply runs only after a manual workflow on main,
# and only when that job is in the production GitHub environment.

locals {
  github_plan_subs = [
    "repo:dhuy21/CryptInsa:pull_request",
    "repo:dhuy21/CryptInsa:ref:refs/heads/main",
  ]
  state_bucket = "cryptinsa-tfstate-eu-west-3"
}

data "aws_iam_policy_document" "terraform_assume_plan" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = local.github_plan_subs
    }
  }
}

data "aws_iam_policy_document" "terraform_assume_apply" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:dhuy21/CryptInsa:environment:production"]
    }
  }
}

resource "aws_iam_role" "terraform_plan" {
  name               = "cryptinsa-terraform-plan"
  assume_role_policy = data.aws_iam_policy_document.terraform_assume_plan.json
}

resource "aws_iam_role" "terraform_apply" {
  name               = "cryptinsa-terraform-apply"
  assume_role_policy = data.aws_iam_policy_document.terraform_assume_apply.json
}

data "aws_iam_policy_document" "terraform_state_read" {
  statement {
    sid       = "ListState"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::${local.state_bucket}"]
  }

  statement {
    sid       = "ReadState"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${local.state_bucket}/prod/terraform.tfstate"]
  }

  statement {
    sid    = "LockState"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["arn:aws:s3:::${local.state_bucket}/prod/terraform.tfstate.tflock"]
  }
}

data "aws_iam_policy_document" "terraform_plan" {
  source_policy_documents = [data.aws_iam_policy_document.terraform_state_read.json]

  statement {
    sid    = "WritePlan"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
    ]
    resources = ["arn:aws:s3:::${local.state_bucket}/plans/*"]
  }

  statement {
    sid    = "ReadInfrastructure"
    effect = "Allow"
    actions = [
      "acm:Describe*",
      "acm:List*",
      "cloudfront:Describe*",
      "cloudfront:Get*",
      "cloudfront:List*",
      "ec2:Describe*",
      "ecr:Describe*",
      "ecr:Get*",
      "ecr:List*",
      "iam:Get*",
      "iam:List*",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "ReadFrontendBucket"
    effect = "Allow"
    actions = [
      "s3:Get*",
      "s3:ListBucket",
    ]
    resources = [
      aws_s3_bucket.frontend.arn,
      "${aws_s3_bucket.frontend.arn}/*",
    ]
  }

  statement {
    sid       = "DescribeParameters"
    effect    = "Allow"
    actions   = ["ssm:DescribeParameters"]
    resources = ["*"]
  }

  statement {
    sid    = "ReadOriginVerify"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:ListTagsForResource",
    ]
    resources = ["arn:aws:ssm:eu-west-3:557701609352:parameter/cryptinsa/prod/origin-verify"]
  }

  statement {
    sid       = "DecryptOriginVerify"
    effect    = "Allow"
    actions   = ["kms:Decrypt"]
    resources = ["*"]

    condition {
      test     = "StringEquals"
      variable = "kms:ViaService"
      values   = ["ssm.eu-west-3.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "terraform_apply" {
  source_policy_documents = [data.aws_iam_policy_document.terraform_state_read.json]

  statement {
    sid    = "WriteState"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = [
      "arn:aws:s3:::${local.state_bucket}/prod/terraform.tfstate",
      "arn:aws:s3:::${local.state_bucket}/plans/*",
    ]
  }

  statement {
    sid    = "ChangeStack"
    effect = "Allow"
    actions = [
      "acm:*",
      "cloudfront:*",
      "ec2:*",
      "ecr:*",
    ]
    resources = ["*"]
  }

  statement {
    sid     = "ChangeFrontendBucket"
    effect  = "Allow"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.frontend.arn,
      "${aws_s3_bucket.frontend.arn}/*",
    ]
  }

  statement {
    sid       = "ReadIam"
    effect    = "Allow"
    actions   = ["iam:Get*", "iam:List*"]
    resources = ["*"]
  }

  statement {
    sid    = "ChangeProjectRoles"
    effect = "Allow"
    actions = [
      "iam:*",
    ]
    resources = [
      "arn:aws:iam::557701609352:role/cryptinsa-*",
      "arn:aws:iam::557701609352:instance-profile/cryptinsa-*",
      "arn:aws:iam::557701609352:oidc-provider/token.actions.githubusercontent.com",
    ]
  }

  statement {
    sid       = "PassEc2Role"
    effect    = "Allow"
    actions   = ["iam:PassRole"]
    resources = ["arn:aws:iam::557701609352:role/cryptinsa-ec2"]

    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["ec2.amazonaws.com"]
    }
  }

  statement {
    sid    = "DenyUserAdministration"
    effect = "Deny"
    actions = [
      "iam:AttachUserPolicy",
      "iam:CreateAccessKey",
      "iam:CreateUser",
      "iam:DeleteUser",
      "iam:PutUserPolicy",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "DescribeParameters"
    effect    = "Allow"
    actions   = ["ssm:DescribeParameters"]
    resources = ["*"]
  }

  statement {
    sid    = "ChangeOriginVerify"
    effect = "Allow"
    actions = [
      "ssm:AddTagsToResource",
      "ssm:DeleteParameter",
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:ListTagsForResource",
      "ssm:PutParameter",
      "ssm:RemoveTagsFromResource",
    ]
    resources = ["arn:aws:ssm:eu-west-3:557701609352:parameter/cryptinsa/prod/origin-verify"]
  }

  statement {
    sid    = "UseSsmKey"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:Encrypt",
      "kms:GenerateDataKey",
    ]
    resources = ["*"]

    condition {
      test     = "StringEquals"
      variable = "kms:ViaService"
      values   = ["ssm.eu-west-3.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "terraform_plan" {
  name   = "cryptinsa-terraform-plan"
  role   = aws_iam_role.terraform_plan.id
  policy = data.aws_iam_policy_document.terraform_plan.json
}

resource "aws_iam_role_policy" "terraform_apply" {
  name   = "cryptinsa-terraform-apply"
  role   = aws_iam_role.terraform_apply.id
  policy = data.aws_iam_policy_document.terraform_apply.json
}
