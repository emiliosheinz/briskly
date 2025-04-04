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
- AWS S3

## Infra setup

Briskly's infra setup is partially configured using Terraform and partially configured manually. But you should be able to have it up and running in under a hour. 

### Terraform

Terraform will help us configure all the infrastructural parts that run on AWS (S3 Bucket and Cloudfront Distribution).

The available environments are:

- dev
- prod

1. Create the Terraform backend bucket

```bash
aws s3api create-bucket --bucket briskly-terraform-backend --region us-east-1
```

2. Enable versioning (optional but recommended) 

```bash
aws s3api put-bucket-versioning --bucket briskly-terraform-backend --versioning-configuration Status=Enabled
```

3. Init Terraform based on the environment you want to setup

```bash
terraform init -reconfigure -backend-config="key=terraform/dev.tfstate"
```

4. Run plan based on the environment you want to setup

```bash
terraform plan -var-file="dev.tfvars"
```

5. Run apply based on the environment you want to setupa

```bash
terraform apply -var-file="dev.tfvars" -auto-approve
```

This will generate a few of the environment variables we need to run the application

- `AWS_REGION`: `us-east-1` if you didn't change it
- `AWS_S3_BUCKET`: `briskly-dev | briskly-prod` depending on the environment you are setting up

- `AWS_CLOUD_FRONT_URL`

```bash
aws cloudfront list-distributions --query "DistributionList.Items[*].{ID:Id,Domain:DomainName}"
```

- `AWS_S3_ACCESS_KEY_ID`

```bash
aws ssm get-parameter --name "/briskly/dev/AWS_S3_ACCESS_KEY_ID" --with-decryption --query "Parameter.Value" --output text
```

- `AWS_S3_SECRET_ACCESS_KEY`

```bash
-aws ssm get-parameter --name "/briskly/dev/AWS_S3_SECRET_ACCESS_KEY" --with-decryption --query "Parameter.Value" --output text
```

### Manual setup

- Create a PostgreSQL database and add the connection string to your `.env` file as `DATABASE_URL`
- Deploy the [Generate Flash Cards Service](https://github.com/emiliosheinz/briskly-generate-flash-cards) and add the connection string to your `.env` file as `NEXT_PUBLIC_BRISKLY_GENERATE_FLASH_CARDS_API_URL`
- Create an OpenAI API key and add it to your `.env` file as `OPENAI_API_KEY`
- Configure Google OAuth credentials and add the client ID and secret to your `.env` file as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Deploy the frontend. As this is a Next.js application I recommend using Vercel, but feel free to use any other hosting provider. Just make sure to add the environment variables from the `.env` file to it.

## :wrench: Running locally

After having at least the AWS infrastruture up and running, the Google OAuth credentials and the OpenAI API key, you can run the application locally.

- Go to the root folder
  ```
  cd briskly
  ```
- Create a `.env` file based on  `.env.example` and add the environment variables you generated
- Install all dependencies
  ```
  yarn
  ```
- Start the database service
  ```
  docker-compose up -d
  ```
- Run the dev server
  ```
  yarn dev
  ```
- Additionally, you need to make sure that the [Generate Flash Cards Service](https://github.com/emiliosheinz/briskly-generate-flash-cards) is running somewhere. It can be locally, on your machine, or deployed on a server.
