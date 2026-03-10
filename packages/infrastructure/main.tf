terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket       = "global-tf-states"
    key          = "tools/terraform.tfstate"
    region       = "eu-central-1"
    use_lockfile = true # S3 native locking (no DynamoDB needed)
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      application = "tools"
      owner       = "terraform"
    }
  }
}

# Provider alias for CloudFront certificate (must be in us-east-1)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      application = "tools"
      owner       = "terraform"
    }
  }
}


data "aws_acm_certificate" "main_certificate" {
  provider    = aws.us_east_1
  domain      = "*.isnan.eu"
  statuses    = ["ISSUED"]
  most_recent = true
}

data "aws_route53_zone" "primary" {
  name = "isnan.eu."
}

data "aws_region" "current" {}

locals {
  domain_name = "tools.isnan.eu"
}
