output "bucket" {
  description = "S3 bucket that stores Terraform state for every root except this one."
  value       = aws_s3_bucket.tfstate.bucket
}

output "region" {
  description = "Region of the Terraform state bucket."
  value       = aws_s3_bucket.tfstate.region
}
