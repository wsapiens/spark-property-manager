var table;
var userId;
$(function(){
  feather.replace()
  $(".manager-content-header").click(function () {
    $header = $(this);
    //getting the next element
    $content = $header.next();
    //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
    $content.slideToggle(500, function () {
      //execute this after slideToggle is done
      //change text of header based on visibility of content div
      const managerContentHeaderIcon = $('#manager-content-header-icon');
      if($content.is(":visible")) {
        managerContentHeaderIcon.html(feather.icons['minus-circle'].toSvg());
        // headerIcon.replaceWith(feather.icons['minus-circle'].toSvg());
      } else {
        managerContentHeaderIcon.html(feather.icons['plus-circle'].toSvg());
      }
    });
  });
  $('#nav-dashboard').removeClass('active');
  $('#nav-expense').removeClass('active');
  $('#nav-import').removeClass('active');
  $('#nav-work').removeClass('active');
  $('#nav-vendor').removeClass('active');
  $('#nav-tenant').removeClass('active');
  $('#nav-property').removeClass('active');
  $('#nav-unit').removeClass('active');
  $('#nav-payment').removeClass('active');
  $('#nav-user').addClass('active');

  $('#submit-button').on('click', function() {
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    var loginEmail = $('#email-text').val();
    var firstName = $('#firstname-text').val();
    var lastName = $('#lastname-text').val();
    var phoneNumber = $('#phone-text').val();
    var isManager = $('#is-manager-checkbox').prop('checked');

    if( !phoneNumber) {
      phoneNumber = '';
    }

    if( loginEmail && firstName ) {
      if(userId) {
        $.ajax({
          url:"/users/"+userId,
          type: "PUT",
          data: JSON.stringify({
                                  email: loginEmail,
                                  firstname: firstName,
                                  lastname: lastName,
                                  phone: phoneNumber,
                                  is_manager: isManager
                                }),
          contentType: "application/json; charset=utf-8",
          headers: { "CSRF-Token": token },
          dataType: "json",
          statusCode: {
            200: function() {
              table.api().ajax.url("/users").load();
              $('#email-text').val('');
              $('#firstname-text').val('');
              $('#lastname-text').val('');
              $('#phone-text').val('');
              if($('#is-manager-checkbox').prop('checked')) {
                $('#is-manager-checkbox').click();
              }
              userId = null;
              // refreshTable(table, false);
              rows_selected=[];
              table.api().clear();
              table.api().ajax.reload();
              $("html, body").animate({ scrollTop: $(document).height() }, "slow");
            },
            400: function(response) {
              resultPopup(response);
            },
            401: function() {
              location.reload();
            },
            500: function(response) {
              resultPopup(response);
            }
          }
        });
      } else {
        $.ajax({
          url:"/users/",
          type: "POST",
          data: JSON.stringify({
                  email: loginEmail,
                  firstname: firstName,
                  lastname: lastName,
                  phone: phoneNumber,
                  is_manager: isManager
                }),
          contentType: "application/json; charset=utf-8",
          headers: { "CSRF-Token": token },
          dataType: "json",
          statusCode: {
            200: function() {
              table.api().ajax.url("/users").load();
              $('#email-text').val('');
              $('#firstname-text').val('');
              $('#lastname-text').val('');
              $('#phone-text').val('');
              if($('#is-manager-checkbox').prop('checked')) {
                $('#is-manager-checkbox').click();
              }
              $("html, body").animate({ scrollTop: $(document).height() }, "slow");
            },
            400: function(response) {
              resultPopup(response);
            },
            401: function() {
              location.reload();
            },
            500: function(response) {
              resultPopup(response);
            }
          }
        });
      }
    } else {
      alert('Email and Firstname are required!');
    }
  });

  table = $('#users').dataTable({
            ajax: "/users",
            columns: [
                { data: null,
                  searchable: false,
                  orderable: false,
                  width: '4%',
                  className: 'dt-body-center',
                  render: function () {
                            return '<input type="checkbox">';
                          }
                },
                { data: 'id', width : '8%', className: 'dt-body-center' },
                { data: 'email',
                  className: 'dt-body-center',
                  render: function (email) {
                            return '<a href="mailto:' + email + '">' + email + '</a>';
                          }
                 },
                { data: 'firstname', className: 'dt-body-center'},
                { data: 'lastname', className: 'dt-body-center'},
                { data: 'phone',
                  className: 'dt-body-center',
                  render: function (phone) {
                            return '<a href="tel:' + phone + '">' + phone + '</a>';
                          }
                },
                { data: 'is_manager', className: 'dt-body-center', width : '10%' }
            ],
            order: [[ 1, "desc" ]],
            processing: true,
            //"serverSide": true,
            paging: true,
            searching: true,
            pagingType: "full_numbers",
            scrollX: true,
            select: {
              style:    'os',
              selector: 'td:first-child'
            }
        }
  );

  // Handle click on checkbox
  $('#users tbody').on('click', 'input[type="checkbox"]', function(e){
    var $row = $(this).closest('tr');
    // Get row data
    var data = table.api().row($row).data();
    // Determine whether row ID is in the list of selected row IDs
    var index = $.inArray(data, rows_selected);

    // If checkbox is checked and row ID is not in list of selected row IDs
    if(this.checked && index === -1){
      rows_selected.push(data);
    // Otherwise, if checkbox is not checked and row ID is in list of selected row IDs
    } else if (!this.checked && index !== -1){
      rows_selected.splice(index, 1);
    }

    if(this.checked){
      $row.addClass('selected');
    } else {
      $row.removeClass('selected');
    }

    // Update state of "Select all" control
    updateDataTableSelectAllCtrl(table);

    // Prevent click event from propagating to parent
    e.stopPropagation();
  });

  // Handle click on table cells with checkboxes
  $('#users').on('click', 'tbody td, thead th:first-child', function(){
    $(this).parent().find('input[type="checkbox"]').trigger('click');
  });

  // Handle click on "Select all" control
  $('thead input[name="select_all"]', table.api().table().container()).on('click', function(e){
    if(this.checked){
      $('#users tbody input[type="checkbox"]:not(:checked)').trigger('click');
    } else {
      $('#users tbody input[type="checkbox"]:checked').trigger('click');
    }

    // Prevent click event from propagating to parent
    e.stopPropagation();
  });

  // Handle table draw event
  table.on('draw', function(){
    // Update state of "Select all" control
    updateDataTableSelectAllCtrl(table);
  });
});

$(document).on('click', '#delete-button', function(){
  if(0 !== rows_selected.length) {
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    $.each(rows_selected, function(key, value){
      $.ajax({
        url:"/users/"+value.id,
        type: "DELETE",
        // data: JSON.stringify({"ids": ids}),
        contentType: "application/json; charset=utf-8",
        headers: { "CSRF-Token": token },
        dataType: "json",
        statusCode: {
          200: function() {
                rows_selected=[];
                refreshTable(table, true);
               },
          400: function(response) {
                resultPopup(response);
               },
          401: function() {
                location.reload();
               },
          500: function(response) {
                resultPopup(response);
               }
        }
      });
    });
  }
});

$(document).on('click', '#edit-button', function(){
  if(1 === rows_selected.length) {
    $.get("/users/"+rows_selected[0].id, function(data, status){
      if("success" === status) {
        $('#email-text').val(data.email);
        $('#firstname-text').val(data.firstname);
        $('#lastname-text').val(data.lastname);
        $('#phone-text').val(data.phone);
        if($('#is-manager-checkbox').prop('checked') != data.is_manager) {
          $('#is-manager-checkbox').click();
        }
        userId = rows_selected[0].id;
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });
  }
});
