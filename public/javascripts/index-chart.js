var chartByType;
var chartByUnit;
var chartByMonth;
$(document).ready(function(){
  $.get("/expenses/types", function(data, status){
    var ctx = document.getElementById('chartByType').getContext('2d');
    chartByType = new Chart(ctx,{
      type: 'doughnut',
      data: data,
      options: {
        title: {
           display: true,
           text: 'Expense By Type'
        }
      }
    });
  });

  $.get("/expenses/units", function(data, status){
    var ctx = document.getElementById('chartByUnit').getContext('2d');
    chartByUnit = new Chart(ctx,{
      type: 'doughnut',
      data: data,
      options: {
        title: {
           display: true,
           text: 'Expense By Unit'
        }
      }
    });
  });

  $.get("/expenses/times", function(data, status){
    var ctx = document.getElementById('chartByTime').getContext('2d');
    chartByMonth = new Chart(ctx,{
      type: 'bar',
      data: data,
      options: {
        title: {
           display: true,
           text: 'Expense By Month'
        }
      }
    });
  });
});
