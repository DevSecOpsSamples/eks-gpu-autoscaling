
docker build -t cpu-api .

docker tag cpu-api:latest 681747700094.dkr.ecr.ap-northeast-2.amazonaws.com/cpu-api:latest

aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 681747700094.dkr.ecr.ap-northeast-2.amazonaws.com

docker push 681747700094.dkr.ecr.ap-northeast-2.amazonaws.com/cpu-api:latest
