import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="backend", port=8000, reload=True)
