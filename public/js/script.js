


function renderSearchSuggestion(suggestions){
    $('#suggestions-list').empty();
    console.log(suggestions.search)
    suggestions.search.categories.forEach(suggestion => {
        $('#suggestions-list').append('<li><a href="/course/search?search='+suggestion.name+'"> '+ suggestion.name + '</a></li>');
    });
    suggestions.search.courses.forEach(suggestion => {
        $('#suggestions-list').append('<li><a href="/course/view/'+suggestion._id+'"> '+ suggestion.title + '</a></li>');
    });
 
}

let searchResult;
function fetchSearchSuggestions(query){
    //cancel previous search
    
    if(searchResult){
        //abort any ajax calls
         console.log(searchResult);
        searchResult.abort();
       
    }
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

$(document).ready(function (){

    $('#search-button').keyup('input', function(){
        const query = $(this).val();
        //call function to fetch search suggestions
        fetchSearchSuggestions(query);
    });
});    