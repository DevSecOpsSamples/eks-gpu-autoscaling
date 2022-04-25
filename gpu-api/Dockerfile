
# FROM python:3.6.6-slim
# FROM python:3.8.13-slim-buster
FROM anibali/pytorch:1.10.2-cuda11.3

VOLUME ./:app/

# RUN apt update && \
#     apt install htop

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . /app/
WORKDIR /app
EXPOSE 8000

# ENV FLASK_ENV=development 
# ENV FLASK_APP=flask_api.py
 
CMD ["gunicorn", "flask_api:app", "--bind", "0.0.0.0:8000"]