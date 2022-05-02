import torch

def cuda():
    if torch.cuda.is_available():
        return "'torch.cuda.is_available': {}, 'torch.cuda.device_coun': {}, 'torch.cuda.current_device': {}, 'torch.cuda.get_device_name': {}".format(str(torch.cuda.is_available()), str(torch.cuda.device_count()), str(torch.cuda.current_device()), torch.cuda.get_device_name(torch.cuda.current_device()))
    else:
        return "'torch.cuda.is_available': {}".format(str(False))

if __name__ == '__main__':
    print(cuda())