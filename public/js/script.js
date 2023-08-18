

function renderSearchSuggestion(suggestions){
    $('#suggestions-list').empty();
    $('.dropdown-menu').empty();    
    $('.dropdown-menu').css('display', 'block');
    var searchResultsDropdown = $('#searchResultsDropdown');

    suggestions.search.categories.forEach(function(item) {
      //  var listItem = $('<a>').addClass('dropdown-item').attr('href', "/course/search-h?search="+item.name+"").text(item.name);
        var listItem = $('<a>').addClass('dropdown-item').attr('href', "/course/search?search="+item.name+"").text(item.name);
        searchResultsDropdown.prepend(listItem);
       
      });
      suggestions.search.courses.forEach(function(item) {
        //var listItem = $('<a>').addClass('dropdown-item').attr('href', "/course/view-course/"+item._id+"").text(item.title);
        var listItem = $('<a>').addClass('dropdown-item').attr('href', "/course/view/"+item._id+"").text(item.title);
        searchResultsDropdown.prepend(listItem);
      });


    console.log(suggestions.search);
    suggestions.search.categories.forEach(suggestion => {
        $('#suggestions-list').append('<li><a href="/course/search?search='+suggestion.name+'"> '+ suggestion.name + '</a></li>');
    });
    suggestions.search.courses.forEach(suggestion => {
        $('#suggestions-list').append('<li><a href="/course/view/'+suggestion._id+'"> '+ suggestion.title + 'Course <img width="10%" src="'+suggestion.image +'"/> </a> </li>');
    });
 
}

let searchResult;
var activeRequest = null;
function fetchSearchSuggestions(query){
    //cancel previous search
    
    if(searchResult){
        //abort any ajax calls
         console.log(searchResult);
        searchResult.abort();
       
    }
    if(query === ""){
        console.log("nothing");
        searchResult.abort();
        return;
    }else{
         //make a new search request with a delay to avoid sending requests for every keyStroke
    setTimeout(()=>{
        searchResult = $.ajax({
            url:'/course/search-suggest',
            type: 'GET',
            data:{search:query},
            beforeSend: function(){
                if(searchResult != null){
                    searchResult.abort();
                }
            },
            success: function(response){
              console.log(response);
              //location.reload();
             
              renderSearchSuggestion(response);
            },
            error: function(response){
              console.error('Put request failed', response.error);
              $('#searchResults').css('display', 'none');
            }
          });
        // searchResult = $.ajax({
        //     URL:'course/search-suggest',
        //     method: 'GET',
        //     data:{search:query},
        //     success:function(suggestions){
        //         console.log(suggestions)
        //     },
        //     error: function(error){
        //         console.error(error);
        //     }
        // });
    },3000);
    }
   
}

$(document).ready(function (){

    $('#search-button').keyup('input', function(){
        var query = $(this).val().trim();
        //call function to fetch search suggestions
        fetchSearchSuggestions(query);
    });
    $('#search-button').on('focusout', function () {
        // Set a delay before hiding the dropdown menu
        hideTimeout = setTimeout(function () {
          $('.dropdown-menu').css('display', 'none');
        }, 3000); // Adjust the delay time as needed (in milliseconds)
      });
    
      // Cancel the hide timeout if the search button is clicked again
      $('#search-button').on('click', function () {
        clearTimeout(hideTimeout);
      });
});    

