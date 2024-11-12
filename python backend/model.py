import sys
import json
from llama_cpp import Llama

# Path to the GGUF model file
model_path = "path/to/TherapyLlama-8B-v1-Q2_K.gguf"  # Update with the actual path to your GGUF file

# Initialize the model using llama-cpp-python
llm = Llama(model_path=model_path)

def generate_response(input_text):
    # Generate a response using the model
    response = llm.create_chat_completion(
        messages=[
            {"role": "user", "content": input_text}
        ]
    )
    # Extract the response text
    return response["choices"][0]["message"]["content"]

if __name__ == "__main__":
    # Read the prompt from command-line arguments
    input_text = sys.argv[1]
    response = generate_response(input_text)

    # Output response in JSON format for Node.js to parse
    print(json.dumps({"response": response}))
