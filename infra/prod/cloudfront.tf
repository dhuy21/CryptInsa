# The header value is stored by CloudFront itself, so it also lands in
# Terraform state. It is not in Git. Nginx will read the SSM copy.

resource "random_password" "origin_verify" {
  length  = 32
  special = false
}

resource "aws_ssm_parameter" "origin_verify" {
  name  = "/cryptinsa/prod/origin-verify"
  type  = "SecureString"
  value = random_password.origin_verify.result
}

resource "aws_iam_role_policy" "origin_verify" {
  name = "cryptinsa-origin-verify"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ReadProdParameters"
        Effect   = "Allow"
        Action   = ["ssm:GetParameter", "ssm:GetParameters"]
        Resource = "arn:aws:ssm:eu-west-3:557701609352:parameter/cryptinsa/prod/*"
      },
      {
        Sid    = "UpdateOriginCertificate"
        Effect = "Allow"
        Action = ["ssm:PutParameter"]
        Resource = [
          "arn:aws:ssm:eu-west-3:557701609352:parameter/cryptinsa/prod/origin-tls-fullchain",
          "arn:aws:ssm:eu-west-3:557701609352:parameter/cryptinsa/prod/origin-tls-key",
        ]
      },
      {
        Sid      = "DecryptProdParameters"
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = "*"
        Condition = {
          StringEquals = {
            "kms:ViaService" = "ssm.eu-west-3.amazonaws.com"
          }
        }
      }
    ]
  })
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "cryptinsa-frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "spa" {
  name    = "cryptinsa-spa-rewrite"
  runtime = "cloudfront-js-2.0"
  comment = "S3 has no try_files. Extensionless routes serve index.html."
  publish = true
  code    = <<-JS
    function handler(event) {
      var uri = event.request.uri;
      if (uri === "/" || uri.indexOf(".") === -1) {
        event.request.uri = "/index.html";
      }
      return event.request;
    }
  JS
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_origin_request_policy" "api" {
  name = "Managed-AllViewerExceptHostHeader"
}

resource "aws_cloudfront_distribution" "site" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "cryptinsa.com"
  price_class     = "PriceClass_100"
  aliases         = ["cryptinsa.com"]
  http_version    = "http2"

  origin {
    origin_id                = "frontend"
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # HTTPS to this name needs a certificate on Nginx. Until that exists, /api
  # answers 502. The name has to exist first: CloudFront rejects an IP origin.
  origin {
    origin_id   = "api"
    domain_name = cloudflare_dns_record.origin.name

    custom_header {
      name  = "X-Origin-Verify"
      value = random_password.origin_verify.result
    }

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_disabled.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.spa.arn
    }
  }

  ordered_cache_behavior {
    path_pattern             = "/api/*"
    target_origin_id         = "api"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.api.id
  }

  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    target_origin_id       = "frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
