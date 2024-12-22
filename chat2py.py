
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = ""
os.environ["OPENAI_API_KEY"] =""

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.graph import START, StateGraph
from typing_extensions import List, TypedDict
from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAIEmbeddings, ChatOpenAI

# set store
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
vector_store = InMemoryVectorStore(embeddings)
llm = ChatOpenAI(verbose=True, temperature=0, model="gpt-4o-mini")

def set_document():
    file_path = r"C://Users/iamal/workspace/train.csv"
    loader = CSVLoader(file_path=file_path,  encoding = 'UTF-8')
    data = loader.load()
    # print(f"Total characters: {len(data[0].page_content)}")
    return data

def split_documents():
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    all_splits = text_splitter.split_documents(set_document())
    # print(f"Split blog post into {len(all_splits)} sub-documents.")
    return all_splits

# create local store
_ = vector_store.add_documents(documents=split_documents())


template = """You are an assistant for question-answering tasks. Use the document(conversation between therapist and patients) provided to answer the question from the therapists to help when they need some guidance on how to best help a patient.
Your response should first, be based from the document, give specific examples and general cases from the therapists and patients, including what the therapist recommended to help the patient. 
For example: 1) summarize what the cases from the document where and 2) then provide guidance on how to help based on the therapist recommendations their patients. Something like this:

Previous cases: (your summary)
Guidance: (Your guidance)

If there are no specific cases that match what the therapist is asking for guidance, then say 'There are no cases that match your request'  find  information 
from reliable sources on how to help the patient with this case. 

{context}

Question: {question}

Helpful Answer:
"""

custom_prompt = PromptTemplate.from_template(template)

class State(TypedDict):
    question: str
    context: List[Document]
    answer: str

def retrieve_vector(state: State):
    retrieved_docs = vector_store.similarity_search(state["question"])
    return {"context": retrieved_docs}

def generate(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["context"])
    messages = custom_prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content}

graph_builder = StateGraph(State).add_sequence([retrieve_vector, generate])
graph_builder.add_edge(START, "retrieve")
graph = graph_builder.compile()

def get_response(ques):
    response = graph.invoke({"question": ques})
    return response["answer"]