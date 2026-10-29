output "frontend_bucket" {
  description = "Private S3 bucket that will hold the Vite build."
  value       = aws_s3_bucket.frontend.bucket
}

output "origin_public_ip" {
  description = "Elastic IP of the Nginx and Django instance."
  value       = aws_eip.origin.public_ip
}

output "ecr_backend_repository" {
  description = "ECR repository for the Django image. Deployments pin a digest."
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_nginx_repository" {
  description = "ECR repository for the origin Nginx image. Deployments pin a digest."
  value       = aws_ecr_repository.nginx.repository_url
}

output "cloudfront_domain" {
  description = "Hostname of the CloudFront distribution. cryptinsa.com points here."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "acm_validation_records" {
  description = "CNAME records Terraform writes to Cloudflare for ACM validation."
  value = [
    for record in cloudflare_dns_record.acm_validation : {
      name    = record.name
      type    = record.type
      content = record.content
    }
  ]
}
