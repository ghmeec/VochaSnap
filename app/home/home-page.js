/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/
var firebase = require("nativescript-plugin-firebase");
const camera = require("nativescript-camera");
const imageModule = require("tns-core-modules/ui/image");
const ImageSource=require("tns-core-modules/image-source").ImageSource;
const Observable = require("tns-core-modules/data/observable").Observable;
const fileSystemModule = require("tns-core-modules/file-system");
var phone = require( "nativescript-phone" );


const HomeViewModel = require("./home-view-model");

const vm = new Observable();


function onNavigatingTo(args) {
    const page = args.object;
    // page.bindingContext = new HomeViewModel();
    vm.set("results", "Results to be displayed here");
    vm.set("vocha", "0000 0000 0000");
    page.bindingContext = vm;

    firebase.init({
        // Optionally pass in properties for database, authentication and cloud messaging,
        // see their respective docs.
    }).then(
        function () {
            console.log("firebase.init done");
        },
        function (error) {
            console.log("firebase.init error: " + error);
        }
    );


}

function onTextRecognitionResult(){
    
   camera.takePicture()   
    .then(function (imageAsset) {
        new ImageSource().fromAsset(imageAsset).then(imageSource => {
       
            const fileToDelete = imageAsset._android
            const file2 = fileSystemModule.File.fromPath(fileToDelete)

            firebase.mlkit.textrecognition.recognizeTextOnDevice({
                image: imageSource // a NativeScript Image or ImageSource, see the demo for examples
              }).then(function(result) {
                
                //deleting the files as the first thing

                file2.remove()
                .then((res) => {
                    // Success removing the file.
                    console.log("File deleted successfully")
                }).catch((err) => {
                    console.log("Failed to deleted the created file");
                });
                
                var vochaNumber =  result.text.split("\n")[1];  
                var isVochaValid=false
                const lines=result.text.split("\n")
                console.log("Here are lines",lines)
                for(var line of lines) {
                    vochaNumber=line.replace(/ /g,'')
                    console.log("Noew results : ",vochaNumber*1)
                    if((!(isNaN(vochaNumber*1)))&&(vochaNumber.length>=12)){
                        vochaNumber=vochaNumber.replace(/ /g,'')
                        vochaNumber=vochaNumber
                        vm.set("results",lines);
                        vm.set("vocha", vochaNumber);

                        isVochaValid=true
                        break   
                    }
                    
                }
                  

                if(isVochaValid){
                    console.log("Voucher :  ",vochaNumber.length," ",vochaNumber)
                    phone.dial("*104*"+vochaNumber+"#",false);
                }else{
                    vm.set("results : ",result.text);
                    vm.set("vocha", "Scan Again !");
                }


            }).catch(function (errorMessage) { 
                console.log("ML Kit error: " + errorMessage); 
                vm.set("results","Try Again !");
                vm.set("vocha", "Try Again !");

                file2.remove()
                .then((res) => {
                    // Success removing the file.
                    console.log("File deleted successfully")
                }).catch((err) => {
                    console.log("Failed to deleted the created file");
                });

                alert({
                    title: "Ooops!",
                    message: "Something went wrong.",
                    okButtonText: "Okay"
                }).then(function () {
                    console.log("Dialog closed!");
                });

                return 
                });
        })


    }).catch(function (err) {
        console.log("Error -> " + err.message);
    });
}
function onTap(args) {
    onTextRecognitionResult()
}


exports.onTap = onTap;
exports.onNavigatingTo = onNavigatingTo;
exports.onTextRecognitionResult=onTextRecognitionResult
