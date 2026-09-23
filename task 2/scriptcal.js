const display = document.querySelector(".display");
function appendToDisplay(value){
    if(display.value==="0"|| display.value==="Error"){
        display.value = value;
    }else{
        display.value += value;
    }
} 
function clearDisplay(){
    display.value = "0";
}
function calculator(){
    try{
        const expression = display.value;
        const result = eval(expression);
        if(isFinite(result)){
            display.value = result;
        }else{
            display.value = "Error"
        }
    }catch(error){
        display.value = "Error"
    }
}
document.addEventListener("keydown", function (event) {
    const key = event.key;

    if ("0123456789.+-*/()".includes(key)) {
        appendToDisplay(key);
    } else if (key === "Enter" || key === "=") {
        calculator();
    } else if (key === "Escape" || key === "Delete") {
        clearDisplay();
    } else if (key === "Backspace") {
       clearDisplay();
    }
});