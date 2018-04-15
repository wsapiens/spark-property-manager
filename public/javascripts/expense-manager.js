var table;
$(document).ready(function(){
  var $property_select = $('#property-select');
  $('#property-select').find('option').remove();
  $('#unit-select').find('option').remove();
  $.get("/properties", function(data, status){
        console.log(data['data']);
        $('#property-select').append('<option>Select Property</option>');
        $.each(data['data'], function(key, value){
          console.log(value);
          console.log(value['id']);
          console.log(value['address_street']);
          $('#property-select').append('<option value=' + value['id'] + '>'
                                  + value['address_street'] + ', '
                                  + value['address_city'] + ','
                                  + value['address_state']
                                  + value['address_zip']
                                  + '</option>');
        });
        if(data['data'].length > 0) {
          $('#property-select option:first').attr("selected",true);
        }
        //$('#property-select').val($('#property-select option:first').val());
    });

    $('#property-select').on('change', function() {
      $('#unit-select').find('option').remove();
      $('#unit-select').append('<option>Select Unit</option>');
      $.get("/properties/" + $(this).val() + "/units", function(data, status){
        console.log(data['data']);
        $.each(data['data'], function(key, value){
          console.log(value);
          console.log(value['id']);
          console.log(value['name']);
          $('#unit-select').append('<option value=' + value['id'] + '>' + value['name'] + '</option>');
        });
        if(data['data'].length === 0) {
          $('#unit-select').val($('#unit-select option:first').val()).change();
        }
      });
    });

    $('#submit-button').on('click', function() {
      var unitId = $('#unit-select').val();
      var payAmount = $('#pay-amount-text').val();
      var payTo = $('#pay-to-text').val();
      var payDesc = $('#pay-desc-text').val();
      console.log(unitId);
      console.log(payAmount);
      console.log(payTo);
      console.log(payDesc);
      if( unitId && payAmount ) {
        $.post("/expenses", {unit_id: unitId, pay_to: payTo, description: payDesc, amount: payAmount})
         .done(function(data) {
           console.log(data);
         })
      } else {
        alert('unit and amount are required!')
      }
    });

    table = $('#expenses').dataTable({
            "ajax": "/expenses",
            "columns": [
                { "data": "id", "width" : "8%" },
                { "data": "unit_id", "width" : "8%" },
                { "data": "address_street", "width" : "20%" },
                { "data": "name" },
                { "data": "address_city" },
                { "data": "pay_to"},
                { "data": "description", "width" : "20%" },
                { "data": "amount" },
                { "data": "pay_time", "width" : "15%" }
            ],
            "order": [[ 0, "asc" ]],
            "processing": true,
            //"serverSide": true,
            "paging": true,
            "searching": true,
            "pagingType": "full_numbers"
        }
    );
});
