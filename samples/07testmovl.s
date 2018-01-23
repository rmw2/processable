        ## ============================================================
        ## 07testmovl.s
        ## ============================================================

        .section ".text"

        movl    $0, %eax
        movl    $0, %ebx
        movl    $0, %ecx
        movl    $0, %edx
        movl    $0, %esi
        movl    $0, %edi
        movl    $0, %ebp
        movl    $0, %esp

        movl    $1, %eax
        movl    $1, %ebx
        movl    $1, %ecx
        movl    $1, %edx
        movl    $1, %esi
        movl    $1, %edi
        movl    $1, %ebp
        movl    $1, %esp

        movl    $2, %eax
        movl    $2, %ebx
        movl    $2, %ecx
        movl    $2, %edx
        movl    $2, %esi
        movl    $2, %edi
        movl    $2, %ebp
        movl    $2, %esp

        movl    $-2, %eax
        movl    $-2, %ebx
        movl    $-2, %ecx
        movl    $-2, %edx
        movl    $-2, %esi
        movl    $-2, %edi
        movl    $-2, %ebp
        movl    $-2, %esp
   
        movl    %eax, %eax
        movl    %eax, %ebx
        movl    %eax, %ecx
        movl    %eax, %edx
        movl    %eax, %esi
        movl    %eax, %edi
        movl    %eax, %ebp
        movl    %eax, %esp

        movl    %eax, %eax
        movl    %ebx, %eax
        movl    %ecx, %eax
        movl    %edx, %eax
        movl    %esi, %eax
        movl    %edi, %eax
        movl    %ebp, %eax
        movl    %esp, %eax

        movl    %eax, 0(%eax)
        movl    %eax, 0(%ebx)
        movl    %eax, 0(%ecx)
        movl    %eax, 0(%edx)
        movl    %eax, 0(%esi)
        movl    %eax, 0(%edi)
        movl    %eax, 0(%ebp)
        # movl  %eax, 0(%esp)  # Intel handles as a special case.  
                               # Your assembler need not handle it.
   
        movl    %eax, 1(%eax)
        movl    %eax, 1(%ebx)
        movl    %eax, 1(%ecx)
        movl    %eax, 1(%edx)
        movl    %eax, 1(%esi)
        movl    %eax, 1(%edi)
        movl    %eax, 1(%ebp)
        # movl  %eax, 1(%esp)  # Intel handles as a special case.  
                               # Your assembler need not handle it.
   
        movl    %eax, 2(%eax)
        movl    %eax, 2(%ebx)
        movl    %eax, 2(%ecx)
        movl    %eax, 2(%edx)
        movl    %eax, 2(%esi)
        movl    %eax, 2(%edi)
        movl    %eax, 2(%ebp)
        # movl  %eax, 2(%esp)  # Intel handles as a special case.  
                               # Your assembler need not handle it.
   
        movl    %eax, -2(%eax)
        movl    %eax, -2(%ebx)
        movl    %eax, -2(%ecx)
        movl    %eax, -2(%edx)
        movl    %eax, -2(%esi)
        movl    %eax, -2(%edi)
        movl    %eax, -2(%ebp)
        # movl  %eax, -2(%esp)  # Intel handles as a special case.  
                                # Your assembler need not handle it.
   
        movl    %eax, 321(%eax)
        movl    %eax, 321(%ebx)
        movl    %eax, 321(%ecx)
        movl    %eax, 321(%edx)
        movl    %eax, 321(%esi)
        movl    %eax, 321(%edi)
        movl    %eax, 321(%ebp)
        # movl  %eax, 321(%esp)  # Intel handles as a special case.  
                                 # Your assembler need not handle it.
   
        movl    %eax, 321(%eax) 
        movl    %ebx, 321(%eax)
        movl    %ecx, 321(%eax)
        movl    %edx, 321(%eax)
        movl    %esi, 321(%eax)
        movl    %edi, 321(%eax)
        movl    %ebp, 321(%eax)
        movl    %esp, 321(%eax)

        movl    0(%eax), %eax
        movl    0(%eax), %ebx
        movl    0(%eax), %ecx
        movl    0(%eax), %edx
        movl    0(%eax), %esi
        movl    0(%eax), %edi
        movl    0(%eax), %ebp
        movl    0(%eax), %esp

        movl    1(%eax), %eax
        movl    1(%eax), %ebx
        movl    1(%eax), %ecx
        movl    1(%eax), %edx
        movl    1(%eax), %esi
        movl    1(%eax), %edi
        movl    1(%eax), %ebp
        movl    1(%eax), %esp

        movl    2(%eax), %eax
        movl    2(%eax), %ebx
        movl    2(%eax), %ecx
        movl    2(%eax), %edx
        movl    2(%eax), %esi
        movl    2(%eax), %edi
        movl    2(%eax), %ebp
        movl    2(%eax), %esp

        movl    -2(%eax), %eax
        movl    -2(%eax), %ebx
        movl    -2(%eax), %ecx
        movl    -2(%eax), %edx
        movl    -2(%eax), %esi
        movl    -2(%eax), %edi
        movl    -2(%eax), %ebp
        movl    -2(%eax), %esp

        movl    321(%eax), %eax
        movl    321(%eax), %ebx
        movl    321(%eax), %ecx
        movl    321(%eax), %edx
        movl    321(%eax), %esi
        movl    321(%eax), %edi
        movl    321(%eax), %ebp
        movl    321(%eax), %esp
  
        movl    321(%eax), %eax
        movl    321(%ebx), %eax
        movl    321(%ecx), %eax
        movl    321(%edx), %eax
        movl    321(%esi), %eax
        movl    321(%edi), %eax
        movl    321(%ebp), %eax
        # movl  321(%esp), %eax  # Intel handles as a special case.  
                                 # Your assembler need not handle it.

        movl    $somelabel, %eax 
        movl    $somelabel, %ebx
        movl    $somelabel, %ecx
        movl    $somelabel, %edx
        movl    $somelabel, %esi
        movl    $somelabel, %edi
        movl    $somelabel, %ebp
        movl    $somelabel, %esp

