#!/bin/bash 
echo "================ ESLINT-DISABLE CHECK ================"
cmd="grep -inR \"\/\*\s*eslint-disable\s*\*\/\" ./src"
output=$(eval "$cmd")
echo "$output"
echo "----------------------  RESULT ----------------------"

if [ ${#output} -eq 0 ] then 
  echo -e "\e[32m Tests Passed! \e[0m"
  exit 0
else
  echo -e "\e[31m Tests Failed! \e[0m"
  exit 1
fi