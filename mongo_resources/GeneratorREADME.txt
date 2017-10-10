Usage

JSON Generator has a convenient syntax. You can specify JavaScript object for template that you see in the left box. It will be cloned in infinite depth. Fields may have any name and value, but it must be valid JavaScript. Values, which are strings, may contain one or more template tags. When you click "Generate" the data source object to be copied several times and the place of tags will be inserted random values.

You can copy the generated JSON to clipboard by clicking "Copy to clipboard". If you click "Upload", JSON will be stored on the server and you can download generated file by clicking "Download" button or access it via ajax-request by URL that will be copied to clipboard after clicking "Copy URL" button. Yes, JSON Generator can JSONP :) Supported HTTP methods are: GET, POST, PUT, OPTIONS.

Size of uploaded generated files does not exceed 500 kB. Size appears at the top right of the field with the generated data. If file size text is red - file is too large for saving on server, but you can copy it to your clipboard and save locally to *.json file.

You can choose indentation for the generated JSON from the drop-down list. Also when you copy the link to uploaded code there is an "indent" param in URL. It can has values of 2, 3 and 4. If param is not specified code will be compact. Example: http://www.json-generator.com/j/JSON_ID?indent=4

Also you can choose status code for response by passing "status" param in URL. Example: http://www.json-generator.com/j/JSON_ID?status=401

JSON Generator remembers your last template in localStorage. If you want to reset it, click "Reset" button to reset template and UI.