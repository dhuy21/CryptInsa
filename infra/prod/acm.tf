# Public certificate for the viewer. The validation CNAME is the Cloudflare
# record in dns.tf. This resource does not wait; the validation resource
# below waits after that record exists.

resource "aws_acm_certificate" "site" {
  provider          = aws.us_east_1
  domain_name       = "cryptinsa.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "site" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for record in cloudflare_dns_record.acm_validation : record.name]
}
