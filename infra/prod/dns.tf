# DNS stays at Cloudflare Registrar, so the AWS provider cannot create these
# records. Values come from the ACM certificate. Strip the trailing dot:
# Cloudflare stores the target without it and would otherwise plan a change
# on every apply. proxied must stay false or ACM never sees the CNAME target.
# The record has to remain for the life of the certificate so ACM can renew it.

locals {
  cloudflare_zone_id = "8884df55a0e5ece52ffabe2cba6c6060" # cryptinsa.com
}

resource "cloudflare_dns_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => {
      name    = trimsuffix(dvo.resource_record_name, ".")
      type    = dvo.resource_record_type
      content = trimsuffix(dvo.resource_record_value, ".")
    }
  }

  zone_id = local.cloudflare_zone_id
  name    = each.value.name
  type    = each.value.type
  content = each.value.content
  ttl     = 60
  proxied = false
  comment = "ACM DNS validation for cryptinsa.com. Do not delete; renewal depends on it."
}

# CloudFront refuses a raw IP as an origin. Grey cloud, so CloudFront reaches
# the Elastic IP directly. The security group only allows the CloudFront prefix list.
resource "cloudflare_dns_record" "origin" {
  zone_id = local.cloudflare_zone_id
  name    = "origin.cryptinsa.com"
  type    = "A"
  content = aws_eip.origin.public_ip
  ttl     = 60
  proxied = false
  comment = "API origin for CloudFront. DNS only."
}

# Apex CNAME is flattened by Cloudflare. Grey cloud, or visitors would hit
# Cloudflare instead of the certificate on this distribution.
resource "cloudflare_dns_record" "apex" {
  zone_id = local.cloudflare_zone_id
  name    = "cryptinsa.com"
  type    = "CNAME"
  content = aws_cloudfront_distribution.site.domain_name
  ttl     = 60
  proxied = false
  comment = "Public site. DNS only."
}
