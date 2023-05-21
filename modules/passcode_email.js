exports.html =(update_passcode,data)=>{
    update_passcode =  JSON.parse(JSON.stringify(update_passcode));
    const html =`<!DOCTYPE html>
    <html lang="en">
    <head>
        
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&display=swap');
        
    
    
    
    *,
    *::after,
    *::before{
      box-sizing: border-box;
    }
    p,ul,ol,li{
        margin: 0px;
        padding: 0px;
        font-family: 'Inter', sans-serif;
    }
    a,img{
      margin: 0px;
      padding: 0px;
      text-decoration: none !important;
    }
    h1,h2,h3,h4,h5,h6{
          margin: 0px;
        padding: 0px;
        font-family: 'Inter', sans-serif;
    }
    ul,li{
      list-style: none;
    }
    
    .mine {
      width: 600px;
      text-align: center;
      border: 15px solid #000;
      padding: 37px 21px;
      border-radius: 60px;
      margin: 50px auto;
      max-width:100%;
    }
    .tag {
      display: flex;
      justify-content: center;
    }
    .tag img {
      background-color: #4361EE;
      width: 29px;
      height: 34px;
      padding: 5px;
      border-radius: 7px;
      margin-right: 10px;
    }
    .in h2 {
      font-size: 29px !important;
      font-weight: 600;
    }
    .in h5 {
      font-size: 25px;
      font-weight: 700;
      padding-top: 27px;
    }
    .in p {
      color: #5C677D;
      font-size: 19px;
      font-weight: 700;
      padding-top: 26px;
    }
    .in span {
      padding: 21px 80px;
      background-color: #4361EE;
      font-family: 'Inter', sans-serif;
      border: 3px solid #4361EE;
      margin-top: 37px;
      border-radius: 12px;
      display: inline-block;
      transition-duration: 0.8s;
    }
    .in a {
      font-size: 19px;
      font-weight: 700;
      color: #fff;
      background-color: #4361EE;
    }
    .in span i {
      padding-left: 10px;
    }
    .in i {
      color: #fff;
      font-size: 18px;
      transition-duration: 0.8s;
    }
    .in span:hover {
      border: 3px solid #4361EE;
      background-color: #fff;
      color: #4361EE;
    }
    .in span:hover  i{
      color: #4361EE;
    }
    
    
        </style>
    
    </head>
    <body>
    
    
    
        <div class="mine">
            <div class="in">
                <div class="tag">
                    <img src="https://pearl.ggo.digital/uploads/Hands003@2x.png"><h2>GGO</h2>
                </div>
                <h5>Withdrawal Confirmation</h5>
                <p>Please confirm your withdrawal of ₹${data}.00</p>
                <a href="https://pearl.ggo.digital/api/v1/user/verify_withdraw/${update_passcode._id}?passcode=${update_passcode.passcode}"><span>Confirm<i class="fa fa-arrow-right" aria-hidden="true"></i></span></a>
            </div>
        </div>
    
    
    
    </body>
    </html>`
   return html;
               }