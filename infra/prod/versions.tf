terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  backend "s3" {
    bucket       = "cryptinsa-tfstate-eu-west-3"
    key          = "prod/terraform.tfstate"
    region       = "eu-west-3"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = "eu-west-3"
}

# CloudFront reads certificates only from us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# Token comes from CLOUDFLARE_API_TOKEN. Do not put it in this file.
provider "cloudflare" {}
