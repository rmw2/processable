# Trial questions

1. Open example program fibonacci.s
    - Start the program with the command-line argument 10
        - What is the value of the program counter?
    - Navigate to the beginning of main()
        - What is the current value of the program counter?
        - What is the integer value of argc in %edi?
        - What is the address referenced by argv, in %rsi?
    - Continue until the base case is reached in fib()
        - What is the value of the stack pointer?
        - What is the value on top of the stack?
    - Continue until the program returns to main()
        - What is the value of the stack pointer?
        - What is the return value of fib()?

2. Open example program bugonacci.s
    - Identify the location of the