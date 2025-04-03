# 🤖 Briskly
![Briskly! Your AI powered flashcards app.](/docs/images/banner.png)

Briskly is a flashcard digitization app where I utilize Natural Language Generation and Processing to create flashcards based on context and validate user responses. This enhances the user's study autonomy and reduces friction and steps required for creating a new study deck.

## :computer: Preview
<img width="1470" alt="Screenshot 2023-09-08 at 10 09 24" src="https://github.com/emiliosheinz/briskly/assets/103655828/01260835-d475-4aee-b8b7-6ea9659efacb">

## :fire: Used technologies
- Next.js
- React.js
- Tailwind CSS
- TypeScript
- OpenAI API
- Prisma ORM
- PostgreSQL
- Docker
- Railway

## :wrench: Running locally

- Go to the root folder
  ```
  cd briskly
  ```
- Create a `.env` file based on  `.env.example`
- Fill in all environment variables
- Install all dependencies
  ```
  yarn
  ```
- Setup the database with Docker
  ```
  docker-compose up -d
  ```
- Run the dev server
  ```
  yarn dev
  ```
## Infra setup

```
# Create the terrafrom backend bucket
aws s3api create-bucket --bucket briskly-terraform-backend --region us-east-1 

# Enable versioning (optional but recomended)
aws s3api put-bucket-versioning --bucket briskly-terraform-backend --versioning-configuration Status=Enabled

# Plan
terraform plan -var-file="dev.tfvars"

# Apply
terraform apply -var-file="dev.tfvars" -auto-approve

# Get the relevant environment variables
aws cloudfront list-distributions --query "DistributionList.Items[*].{ID:Id,Domain:DomainName}"

aws ssm get-parameter --name "/briskly/dev/AWS_S3_ACCESS_KEY_ID" --with-decryption --query "Parameter.Value" --output text

aws ssm get-parameter --name "/briskly/dev/AWS_S3_SECRET_ACCESS_KEY" --with-decryption --query "Parameter.Value" --output text
```
