// $('.btn-shorten').on('click', function(){
//   // AJAX call to /api/shorten with the URL that the user entered in the input box
//   $.ajax({
//     url: '/api/shorten',
//     type: 'POST',
//     dataType: 'JSON',
//     data: {url: $('#url-field').val()},
//     success: function(data){
//         // display the shortened URL to the user that is returned by the server
//         var resultHTML = '<a class="result" href="' + data.shortUrl + '">'
//             + data.shortUrl + '</a>';
//         $('#link').html(resultHTML);
//         $('#link').hide().fadeIn('slow');
//     }
//   });

// });

let btn = document.querySelector('.btn-shorten')
let url = document.querySelector('#url-field')

btn.addEventListener('click', function() {

  let data = {
    'url': url.value
  }

  fetch('/api/shorten', {
    method: 'POST',
    body: JSON.stringify(data),
    headers:{
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
  .catch(error => console.error('Error:', error))
  .then(response => {
    let result = `<a class="result" href="${response.shorten}">${response.shorten}</a>`
    document.querySelector('#link').innerHTML = result
  })
})