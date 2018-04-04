rm lambda.zip
cd lambda
npm install
zip -r ../lambda.zip *
cd ..
aws lambda update-function-code --function-name AlexaReceptionist --zip-file fileb://lambda.zip --profile barbarian
