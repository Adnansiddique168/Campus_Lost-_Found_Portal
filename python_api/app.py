import io
import json
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cpu")

try:
    with open('../class_names.json', 'r') as f:
        class_names = json.load(f)
except FileNotFoundError:
    class_names = ["bag", "id_card", "laptop", "other", "phone", "wallet"]

model = models.mobilenet_v2(weights=None)
num_ftrs = model.classifier[1].in_features
model.classifier = nn.Sequential(
    nn.Dropout(p=0.2),
    nn.Linear(num_ftrs, len(class_names))
)

try:
    model.load_state_dict(torch.load('../campus_vision_model.pth', map_location=device))
    model.eval()
    print("Successfully loaded trained model weights.")
except FileNotFoundError:
    print("Warning: campus_vision_model.pth not found.")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

class PredictionRequest(BaseModel):
    imageBase64: Optional[str] = None
    descriptionHint: Optional[str] = ""

@app.get("/")
def read_root():
    return {"message": "Campus Portal Vision AI is running!"}

@app.post("/predict")
async def predict(request: PredictionRequest):
    try:
        if request.imageBase64:
            # Decode base64 image
            b64_str = request.imageBase64
            if "," in b64_str:
                b64_str = b64_str.split(",")[1]
            image_data = base64.b64decode(b64_str)
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
        else:
            return {"success": False, "error": "No image provided"}

        input_tensor = transform(image)
        input_batch = input_tensor.unsqueeze(0)
        
        with torch.no_grad():
            output = model(input_batch)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            top_prob, top_catid = torch.max(probabilities, 0)
            
            category_name = class_names[top_catid]
            confidence = top_prob.item()

        category_map = {
            "bag": "Bag",
            "wallet": "Wallet",
            "laptop": "Electronics",
            "phone": "Mobile",
            "id_card": "ID Card",
            "other": "Other"
        }
        
        frontend_category = category_map.get(category_name, "Other")
        tags = f"{category_name}, auto-detected, conf: {confidence:.2f}"

        return {
            "success": True, 
            "prediction": {
                "itemName": f"Identified {frontend_category}",
                "category": frontend_category,
                "tags": tags,
                "confidence": confidence
            }
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"success": False, "error": str(e)}
