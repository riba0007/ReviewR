/*****************************************************************
File: index.js
Author: Priscila Ribas da Costa
Description: 
    MAD9022 Assignment - ReviewR App.
    Cordova App for IOS using Camara and local storage
Version: 0.0.1
Updated: April 11, 2017

*****************************************************************/
'use strict';
var app = {
    //global variables
    rating : 0,
    img : "",
    reviewId: 0,
    
    //local storage manipulation
    localData : {
        
        /*gets data from local storage*/
        getLocalStorageData : function() {
            
            if ( localStorage ) {
                
                //get local storage data
                let lsData = localStorage.getItem( 'reviewr-riba0007' );

                //if does not exists create a new object. If exists parse to json
                if ( !lsData ) {
                    
                    lsData = this.initList();
                
                } else {
                    
                    lsData = JSON.parse( lsData );

                    //check if lsData is correct
                    if ( lsData.settings == null || lsData.settings.app != "reviewr" ){
                        
                        lsData = this.initList();
                    }
                }
                //returns json data
                return lsData;
            }
            //return an empty object if local storage not available
            return {};
        },

        /*saves data on local storage*/
        saveLocalStorageData : function( lsData ) {
            
            if ( localStorage ){
                
                if ( !lsData ){
                    
                    //gets local storage data. retuns a new object if still does not exists
                    lsData = this.getLocalStorageData();
                }
                
                //saves on local storage
                localStorage.setItem( 'reviewr-riba0007' , JSON.stringify( lsData ) ); 
            }
        },

        /*creates item and saves on local storage*/
        saveItem : function ( name = "" , review , rating = "1" , img = "" ) {
            
            let lsData = this.getLocalStorageData();
            
            //if data does not exists creates a new object
            if ( !lsData ) {
                
                lsData = this.initList();
            }
            
            lsData.reviews.push({ "id" : Date.now() , name , review , rating , img });  
            
            //saves on local storage
            this.saveLocalStorageData( lsData );
        },
        
        /*removes from array and save on local storage*/
        removeItem : function( id ) {
            
            if ( id ) {
                
                let lsData = this.getLocalStorageData();
                
                //removes the item from array 
                lsData.reviews = lsData.reviews.filter( item => item.id == id ? false : true );
                
                //saves on local storage
                this.saveLocalStorageData( lsData );
            }
        },
        
        /*initializes the object to be saved on local storage*/
        initList : function() {
            
            return { "settings" : { "app" : "reviewr" } , "reviews" : [] }
        },

        /*return an object from local storage with same id*/
        getById : function( id ) {
            
            let item = {};
            
            if ( id ) {
            
                let lsData = this.getLocalStorageData();
                
                //if local data exists search for the right id
                if ( lsData && lsData.reviews ) {
                    
                    item = lsData.reviews.filter( item => item.id == id ? true : false )[0];
                }
            } 
                
            return item;
        }
    },
    
    saveReview : function() {
        
        let name = document.getElementById( 'item-name' ).value.trim();
        let review = document.getElementById('item-review').value.trim();
        
        !name ? app.showMessage( 'error' , 'please fill item name' ) : 0;
        
        app.rating == 0 ? app.showMessage( 'error' , 'please rate the new item' ) : 0;
        
        if ( name && app.rating > 0 ) {
            
            app.localData.saveItem( name , review , app.rating , app.img );
        
            app.closeModal();
        }
    },
    
    showMessage : function ( type , message ) {
        
        let content = document.querySelector(".active .content .card");
        
        let main = document.querySelector(".active .content");
        
        let div = document.createElement("div");
        
        div.className = "msg " + type ;
        
        
        //adds opacity
        setTimeout( (function( c, d ){
            
            return function(){
                
                div.classList.add("load");
            
            }
        })( content , div ), 50);
        
        
        div.textContent = message;
        
        main.insertBefore( div, content );
        
        
        //removes msg
        setTimeout( (function( c, d ){
            
            return function(){
                //opacity
                div.classList.remove("load");
                
                //removes from screen
                setTimeout( (function( c, d ){
            
                    return () => main.removeChild( div );
                    
                })( content , div ), 400);
            }
        })( content , div ), 3000);
    },
    
    deleteReview : function() {
        
        app.localData.removeItem( app.reviewId );
        
        app.cleanModal( true );
        
    },
    
    showReview : function( id ){
        
        let review = app.localData.getById( id );
        
        if ( review ) {
            
            app.reviewId = id;
            
            document.querySelector( '#detailsModal img' ).src = review.img ? review.img : 'img/placeholder.png';
            
            document.querySelector( '#detailsModal .content-padded span' ).textContent = review.name;
            
            app.setRating( document.querySelectorAll( '#detailsModal .star' ) , review.rating );
            
        }
        
    },
    
    showListReviews : function(){
        
        //clears the current list
        document.getElementById( "review-list" ).innerHTML = "";
        
        let list = app.localData.getLocalStorageData();
        
        if ( list ) {
            
            list.reviews.forEach( function( item ){
                
                let li = document.createElement( "li" );
                
                li.className = "table-view-cell";
                
                li.innerHTML = ''.concat( '<a class="navigate-right" href="#detailsModal">' ,
                                             '<img class="media-object pull-left" src="' , item.img ? item.img : 'img/placeholder.png' , '">' ,
                                             '<div class="media-body">' ,
                                                '<span>' , item.name , '</span>' ,
                                                '<div class="stars small">' ,
                                                    '<span class="star"></span>' ,
                                                    '<span class="star"></span>' ,
                                                    '<span class="star"></span>' ,
                                                    '<span class="star"></span>' ,
                                                    '<span class="star"></span>' ,
                                                '</div></div></a>' );
                
                //adds Event listeners
                li.querySelector( "a" ).addEventListener( "touchend" , () => app.showReview( item.id ) );
                
                app.setRating( li.querySelectorAll( ".star" ) , item.rating );
                
                //adds item to the list
                document.getElementById( "review-list" ).appendChild(li);
                
            });  
        }
    },
    
    cleanModal : function( close ){
        
        if ( document.querySelector( '.active' ).id == 'addModal' ){
            
            //clean variables
            app.rating = 0;
            app.img = "";
            
            //cleans fields
            document.getElementById( 'item-name' ).value = '';
            document.getElementById( 'item-review' ).value = '';
            app.setRating( document.querySelectorAll( '#addModal .star' ) , 0 );
            document.getElementById( 'review-take-picture' ).classList.remove( 'hidden' );
            document.getElementById( 'review-picture' ).src = 'img/placeholder.png';
            document.getElementById( 'review-picture' ).classList.add( 'hidden' );
        
        } else {
            app.reviewId = 0;
        }
        
        //shows list
        app.showListReviews();
        
        //closes modal
        close ? app.closeModal() : 0;
        
    },
    
    closeModal : function(){
        
        document.querySelector( '.active header a' ).dispatchEvent( new CustomEvent( "touchend" , { bubbles: true, cancelable: true } ) );
    
    },
    
    takePicture : function(){
        //app.img = 'img/logo.png';
        
        let options = {
                          destinationType: Camera.DestinationType.FILE_URI,
                          encodingType: Camera.EncodingType.PNG,
                          mediaType: Camera.MediaType.PICTURE,
                          pictureSourceType: Camera.PictureSourceType.CAMERA,
                          allowEdit: true,
                          targetWidth: 300,
                          targetHeight: 300
                        }
        
        
        let success = function( uri ){ 
            app.img = uri; 
            document.getElementById( 'review-take-picture' ).classList.add( 'hidden' );
            document.getElementById( 'review-picture' ).src = app.img;
            document.getElementById( 'review-picture' ).classList.remove( 'hidden' );
        };
        
        let fail = function ( e ){
            app.showMessage( 'error' , e );
            app.img = '';
        }
        
        navigator.camera.getPicture( success  , fail  , options );
    },
    
    setRating : function( stars , rating){
        
        if ( stars ) {
            
            stars.forEach( function( star , index ){

                if( rating > index ){

                    star.classList.add( 'rated' );

                }else{

                    star.classList.remove( 'rated' );
                }

            });
        }
    },
    
    // deviceready Event Handler
    onDeviceReady : function() {
        
        //shows list
        app.showListReviews();
        
        //listeners
        document.getElementById( 'review-take-picture' ).addEventListener( 'click' , app.takePicture );
        
        document.getElementById( 'review-cancel' ).addEventListener( 'click' , () => app.closeModal());
        
        document.getElementById( 'review-save' ).addEventListener( 'click' , app.saveReview );
        
        document.getElementById( 'review-delete' ).addEventListener( 'click' , app.deleteReview );
        
        document.querySelector( '#addModal header a' ).addEventListener( 'touchend' , () => app.cleanModal( false ));
        
        let stars = document.querySelectorAll( '#addModal .star' );
        
        stars.forEach( function( star , index ){
            
            star.addEventListener( 'click' , (function( idx ){
                
                return function(){
                    
                    app.rating = idx + 1;
                    
                    app.setRating( stars , app.rating );
                }
                
            })( index ));
            
        });
    },
    
    // Application Constructor
    initialize : function() {
        document.addEventListener( 'deviceready' , this.onDeviceReady.bind( this ) , false );
    }
};

app.onDeviceReady();
//app.initialize();