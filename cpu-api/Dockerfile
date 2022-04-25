FROM python:3.9-alpine

VOLUME ./:app/

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . /app/

WORKDIR /app

EXPOSE 8000

CMD ["gunicorn", "flask_api:app", "--bind", "0.0.0.0:8000"]
