
//Otp validation

function validate(){
    let fields = document.querySelectorAll(".form-control");
    let isValid=true;

    fields.forEach(function(field){

        if(field.value.trim()===""||field.value.length>1){
            field.style.border = 'solid 1px red';


            setTimeout(function(){
                field.style.border='';
            },3000);
            isValid= false;
        }
    });

    return isValid;
}

//resend color changing

function resend(){
    const change = document.getElementById('resend');

    change.style.color='green';

    setTimeout(() => {
        change.style.color='';
    }, 1000);
}

//otp timer expairing

let countdownInterval;

function startCountdown(initialValue){
    let n= initialValue;
    countdownInterval = setInterval(()=>{
        if(n===0){
            clearInterval(countdownInterval);
        }
        document.querySelector('.time').innerHTML = n;
        n=n-1;
    },1000);
}

function resend(){
    clearInterval(countdownInterval);
    startCountdown(60);
}
startCountdown(60);
document.getElementById("resend").onclick = function (){
    resend()
};