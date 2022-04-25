import torch
import math

from flask import Flask
from flask import request

app = Flask(__name__)

@app.route("/")
def ping_root():
    return returnRequests()

@app.route("/<string:path1>")
def ping_path1(path1):
    return returnRequests()

@app.route("/<string:path1>/<string:path2>")
def ping_path2(path1, path2):
    return returnRequests()

@app.route("/<string:path1>/<string:path2>/<string:path3>")
def ping_path3(path1, path2, path3):
    return returnRequests()

@app.route("/<string:path1>/<string:path2>/<string:path3>/<string:path4>")
def ping_path4(path1, path2, path3, path4):
    return returnRequests()
 
@app.route("/<string:path1>/<string:path2>/<string:path3>/<string:path4>/<string:path5>")
def ping_path5(path1, path2, path3, path4, path5):
    return returnRequests()

def returnRequests():
    return {
        "host": request.host,
        "url": request.url,
        "method": request.method,
        "message": "Hello, World"
    }

device = 'cuda:0' if torch.cuda.is_available() else 'cpu'

@app.route("/gputest")
def gputest():
    dtype = torch.float

    x = torch.linspace(-math.pi, math.pi, 2000, device=device, dtype=dtype)
    y = torch.sin(x)

    a = torch.randn((), device=device, dtype=dtype)
    b = torch.randn((), device=device, dtype=dtype)
    c = torch.randn((), device=device, dtype=dtype)
    d = torch.randn((), device=device, dtype=dtype)

    learning_rate = 1e-6
    for t in range(2000):
        y_pred = a + b * x + c * x ** 2 + d * x ** 3

        loss = (y_pred - y).pow(2).sum().item()
        if t % 100 == 99:
            print(t, loss)

        grad_y_pred = 2.0 * (y_pred - y)
        grad_a = grad_y_pred.sum()
        grad_b = (grad_y_pred * x).sum()
        grad_c = (grad_y_pred * x ** 2).sum()
        grad_d = (grad_y_pred * x ** 3).sum()

        a -= learning_rate * grad_a
        b -= learning_rate * grad_b
        c -= learning_rate * grad_c
        d -= learning_rate * grad_d

    return f'Result: y = {a.item()} + {b.item()} x + {c.item()} x^2 + {d.item()} x^3'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
