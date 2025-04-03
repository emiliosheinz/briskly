terraform {
  required_version = ">=1.8.1"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "briskly-terraform-backend"
    key    = "dev.tfstate" # This will be overridden dynamically
    region = "us-east-1" 
  }
}

provider "aws" {
  region = var.region 
}

