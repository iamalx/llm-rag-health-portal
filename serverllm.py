from flask import Flask, request
from chat2py import get_response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/gen-therapy-convo/')
def get_ai_ress():
   
    therapist_quest = request.args.get('question')
    response = {}

    if isinstance(therapist_quest, str) and len(therapist_quest):
        gen_res = get_response(therapist_quest)   
        
        response['status_code'] = 201
        response['res'] = gen_res
        return response
    else: 
        response['status_code'] = 400
        response['res'] = 'please try again'
        return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=105)