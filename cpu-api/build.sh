
docker build -t cpu-api .

docker tag cpu-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/cpu-api:latest

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/cpu-api:latest
