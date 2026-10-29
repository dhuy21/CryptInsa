terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"
    }
  }
}

# This root keeps its own state on the machine that first creates the bucket.
# Every other root uses the bucket as its backend.
provider "aws" {
  region = "eu-west-3"
}
