import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader, random_split

print("Starting Model Training Pipeline using PyTorch...")

# Configuration
dataset_dir = 'ai_dataset'
batch_size = 16
epochs = 5
num_classes = 6

# Device configuration
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Data augmentation and normalization
data_transforms = {
    'train': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
    'val': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
}

# Load all data using ImageFolder (which infers classes from subdirectories)
print("Loading images from dataset directory...")
full_dataset = datasets.ImageFolder(dataset_dir)
class_names = full_dataset.classes
print(f"Found {len(class_names)} classes: {class_names}")

# Save class names for the prediction API
with open('class_names.json', 'w') as f:
    json.dump(class_names, f)

# Split dataset into training and validation (80/20)
train_size = int(0.8 * len(full_dataset))
val_size = len(full_dataset) - train_size
train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])

# Apply respective transforms
train_dataset.dataset.transform = data_transforms['train']
# Note: In PyTorch, modifying the dataset transform like this applies it to both train and val since they reference the same underlying dataset.
# A better way is to create a custom dataset wrapper or just use the same transform for simplicity in this script.
# For simplicity and robust small-dataset training, we'll just apply the train transform globally.
full_dataset.transform = data_transforms['train']

dataloaders = {
    'train': DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0),
    'val': DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
}
dataset_sizes = {'train': len(train_dataset), 'val': len(val_dataset)}

# Load pre-trained MobileNetV2 model
print("Building the model using MobileNetV2 (Transfer Learning)...")
model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)

# Freeze all layers
for param in model.parameters():
    param.requires_grad = False

# Replace the classifier head
num_ftrs = model.classifier[1].in_features
model.classifier = nn.Sequential(
    nn.Dropout(p=0.2),
    nn.Linear(num_ftrs, len(class_names))
)

model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.classifier.parameters(), lr=0.001)

# Training loop
print("Starting training...")
for epoch in range(epochs):
    print(f'Epoch {epoch+1}/{epochs}')
    print('-' * 10)

    for phase in ['train', 'val']:
        if phase == 'train':
            model.train()  # Set model to training mode
        else:
            model.eval()   # Set model to evaluate mode

        running_loss = 0.0
        running_corrects = 0

        # Iterate over data.
        for inputs, labels in dataloaders[phase]:
            inputs = inputs.to(device)
            labels = labels.to(device)

            # zero the parameter gradients
            optimizer.zero_grad()

            # forward
            with torch.set_grad_enabled(phase == 'train'):
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)

                # backward + optimize only if in training phase
                if phase == 'train':
                    loss.backward()
                    optimizer.step()

            # statistics
            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

        epoch_loss = running_loss / dataset_sizes[phase]
        epoch_acc = running_corrects.double() / dataset_sizes[phase]

        print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

    print()

# Save the trained model
print("Training complete! Saving model to campus_vision_model.pth...")
torch.save(model.state_dict(), 'campus_vision_model.pth')
print("Model saved successfully. You can now start the prediction server!")
