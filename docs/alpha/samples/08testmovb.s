        ## ============================================================
        ## 08testmovb.s
        ## ============================================================

        .section ".text"

        movb    $0, %al
        movb    $0, %ah
        movb    $0, %bl
        movb    $0, %bh
        movb    $0, %cl
        movb    $0, %ch
        movb    $0, %dl
        movb    $0, %dh

        movb    $1, %al
        movb    $1, %ah
        movb    $1, %bl
        movb    $1, %bh
        movb    $1, %cl
        movb    $1, %ch
        movb    $1, %dl
        movb    $1, %dh

        movb    $2, %al
        movb    $2, %ah
        movb    $2, %bl
        movb    $2, %bh
        movb    $2, %cl
        movb    $2, %ch
        movb    $2, %dl
        movb    $2, %dh

        movb    $-2, %al
        movb    $-2, %ah
        movb    $-2, %bl
        movb    $-2, %bh
        movb    $-2, %cl
        movb    $-2, %ch
        movb    $-2, %dl
        movb    $-2, %dh

        movb    %al, %al
        movb    %al, %ah
        movb    %al, %bl
        movb    %al, %bh
        movb    %al, %cl
        movb    %al, %ch
        movb    %al, %dl
        movb    %al, %dh

        movb    %al, %al
        movb    %ah, %al
        movb    %bl, %al
        movb    %bh, %al
        movb    %cl, %al
        movb    %ch, %al
        movb    %dl, %al
        movb    %dh, %al

        movb    %al, 0(%eax)
        movb    %al, 0(%ebx)
        movb    %al, 0(%ecx)
        movb    %al, 0(%edx)
        movb    %al, 0(%esi)
        movb    %al, 0(%edi)
        movb    %al, 0(%ebp)
        # movb  %al, 0(%esp)  # Intel handles as a special case.  
                              # Your assembler need not handle it.

        movb    %al, 1(%eax)
        movb    %al, 1(%ebx)
        movb    %al, 1(%ecx)
        movb    %al, 1(%edx)
        movb    %al, 1(%esi)
        movb    %al, 1(%edi)
        movb    %al, 1(%ebp)
        # movb  %al, 1(%esp)  # Intel handles as a special case.  
                              # Your assembler need not handle it.

        movb    %al, 2(%eax)
        movb    %al, 2(%ebx)
        movb    %al, 2(%ecx)
        movb    %al, 2(%edx)
        movb    %al, 2(%esi)
        movb    %al, 2(%edi)
        movb    %al, 2(%ebp)
        # movb  %al, 2(%esp)  # Intel handles as a special case.  
                              # Your assembler need not handle it.

        movb    %al, -2(%eax)
        movb    %al, -2(%ebx)
        movb    %al, -2(%ecx)
        movb    %al, -2(%edx)
        movb    %al, -2(%esi)
        movb    %al, -2(%edi)
        movb    %al, -2(%ebp)
        # movb  %al, -2(%esp)  # Intel handles as a special case.  
                               # Your assembler need not handle it.

        movb    %al, 321(%eax)
        movb    %al, 321(%ebx)
        movb    %al, 321(%ecx)
        movb    %al, 321(%edx)
        movb    %al, 321(%esi)
        movb    %al, 321(%edi)
        movb    %al, 321(%ebp)
        # movb  %al, 321(%esp)  # Intel handles as a special case.  
                                # Your assembler need not handle it.

        movb    %al, 321(%eax)
        movb    %ah, 321(%eax)
        movb    %bl, 321(%eax)
        movb    %bh, 321(%eax)
        movb    %cl, 321(%eax)
        movb    %ch, 321(%eax)
        movb    %dl, 321(%eax)
        movb    %dh, 321(%eax)

        movb    0(%eax), %al
        movb    0(%eax), %ah
        movb    0(%eax), %bl
        movb    0(%eax), %bh
        movb    0(%eax), %cl
        movb    0(%eax), %ch
        movb    0(%eax), %dl
        movb    0(%eax), %dh
  
        movb    1(%eax), %al
        movb    1(%ebx), %al
        movb    1(%ecx), %al
        movb    1(%edx), %al
        movb    1(%esi), %al
        movb    1(%edi), %al
        movb    1(%ebp), %al
        # movb  1(%esp), %al  # Intel handles as a special case.  
                              # Your assembler need not handle it.

        movb    2(%eax), %al
        movb    2(%ebx), %al
        movb    2(%ecx), %al
        movb    2(%edx), %al
        movb    2(%esi), %al
        movb    2(%edi), %al
        movb    2(%ebp), %al
        # movb  2(%esp), %al  # Intel handles as a special case.  
                              # Your assembler need not handle it.

        movb    -2(%eax), %al
        movb    -2(%ebx), %al
        movb    -2(%ecx), %al
        movb    -2(%edx), %al
        movb    -2(%esi), %al
        movb    -2(%edi), %al
        movb    -2(%ebp), %al
        # movb  -2(%esp), %al  # Intel handles as a special case.  
                               # Your assembler need not handle it.

        movb    321(%eax), %al
        movb    321(%eax), %ah
        movb    321(%eax), %bl
        movb    321(%eax), %bh
        movb    321(%eax), %cl
        movb    321(%eax), %ch
        movb    321(%eax), %dl
        movb    321(%eax), %dh

        movb    321(%eax), %al
        movb    321(%ebx), %al
        movb    321(%ecx), %al
        movb    321(%edx), %al
        movb    321(%esi), %al
        movb    321(%edi), %al
        movb    321(%ebp), %al
        # movb  321(%esp), %al  # Intel handles as a special case.  
                                # Your assembler need not handle it.

