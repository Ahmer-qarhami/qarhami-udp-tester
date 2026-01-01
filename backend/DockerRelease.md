# --Login to Linux Server--

ssh root@145.223.121.240
CTSqarhami2024+
sudo docker ps

# --Docker Build & Push

docker login -u ahmernajam

docker build -t ahmernajam/qarhami-udp-tester-api:latest .
docker push docker.io/ahmernajam/qarhami-udp-tester-api:latest

# --Removing of last release--

sudo docker rm -f qarhami-udp-tester-api-v1
sudo docker rmi -f ahmernajam/qarhami-udp-tester-api:latest

# --Pulling of Latest Release--

sudo docker pull ahmernajam/qarhami-udp-tester-api:latest
sudo docker run --name qarhami-udp-tester-api-v1 -p 9490:9490 -itd ahmernajam/qarhami-udp-tester-api:latest

# --Auto start on Restart

sudo docker update --restart=always qarhami-udp-tester-api-v1
sudo docker logs qarhami-udp-tester-api-v1

# --Optional Checking Commands

sudo docker ps
docker run --entrypoint /bin/sh -itd mycontainer:latest

------------------- COPY UPLOADS ----------------

#uploads copy
cd ~/mongobkp/uploads

## from local to container

sudo docker cp . mbe-erp-api-v21:/usr/src/app/uploads
sudo docker cp . mbe-erp-api-v32:/usr/src/app/uploads

# --Copy files to docker container--

sudo docker cp qarhami-udp-tester-api-v1:/app/udpServer.js ~/bkp

# --Checking files in backup folder

sudo docker exec -it qarhami-udp-tester-api-v1 sh
cd /data/db/backups/mbe-erp
ls -lt

# --AWS

aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 590184119210.dkr.ecr.us-east-2.amazonaws.docker build -t qarhami-api-reg .
docker tag qarhami-api-reg:latest 590184119210.dkr.ecr.us-east-2.amazonaws.com/qarhami-api-reg:latest
docker push 590184119210.dkr.ecr.us-east-2.amazonaws.com/qarhami-api-reg:latest

--lb
http://qarhami-api-lb-1809598928.us-east-2.elb.amazonaws.com/
