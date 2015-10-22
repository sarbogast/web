/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var syncGatewayURL = 'http://syncgateway:4984/kitchen-sync';




var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');

var COMMENTS_FILE = path.join(__dirname, 'comments.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/api/comments', function(req, res) {
  request({
    method: 'GET',
    url: syncGatewayURL + '/_all_docs?include_docs=true',
    json: true,
    body: req.body
  }, function(req, res2, body) {
    var comments = body.rows.map(function (row) {
      return row.doc;
    });
    res.setHeader('Cache-Control', 'no-cache');
    res.json(comments);
  });
});

app.post('/api/comments', function(req, res) {
  request({
    method: 'POST',
    url: syncGatewayURL + '/',
    json: true,
    body: req.body
  }, function(err, res2, body) {
    request({
      method: 'GET',
      url: syncGatewayURL + '/_all_docs?include_docs=true',
      json: true
    }, function(req, res3, body) {
      var comments = body.rows.map(function (row) {
        return row.doc;
      });
      res.setHeader('Cache-Control', 'no-cache');
      res.json(comments);
    });
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
