	.file	"grader.c"
	.globl	grade
	.data
	.type	grade, @object
	.size	grade, 1
grade:
	.byte	68
	.comm	name,48,32
	.text
	.globl	readString
	.type	readString, @function
readString:
.LFB2:
	.cfi_startproc
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset 6, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register 6
	subq	$80, %rsp
	movq	%rdi, -72(%rbp)
	movl	$0, -4(%rbp)
.L3:
	movq	stdin(%rip), %rax
	movq	%rax, %rdi
	call	fgetc
	movl	%eax, -8(%rbp)
	cmpl	$-1, -8(%rbp)
	je	.L2
	cmpl	$10, -8(%rbp)
	je	.L2
	movl	-8(%rbp), %eax
	movl	%eax, %edx
	movl	-4(%rbp), %eax
	cltq
	movb	%dl, -64(%rbp,%rax)
	addl	$1, -4(%rbp)
	jmp	.L3
.L2:
	movl	-4(%rbp), %eax
	cltq
	movb	$0, -64(%rbp,%rax)
	movl	$0, -4(%rbp)
	jmp	.L4
.L5:
	movl	-4(%rbp), %eax
	movslq	%eax, %rdx
	movq	-72(%rbp), %rax
	addq	%rax, %rdx
	movl	-4(%rbp), %eax
	cltq
	movzbl	-64(%rbp,%rax), %eax
	movb	%al, (%rdx)
	addl	$1, -4(%rbp)
.L4:
	cmpl	$47, -4(%rbp)
	jle	.L5
	leave
	.cfi_def_cfa 7, 8
	ret
	.cfi_endproc
.LFE2:
	.size	readString, .-readString
	.section	.rodata
.LC0:
	.string	"What is your name?"
.LC1:
	.string	"Andrew Appel"
.LC2:
	.string	"%c is your grade.\n"
.LC3:
	.string	"Thank you, %s.\n"
	.text
	.globl	main
	.type	main, @function
main:
.LFB3:
	.cfi_startproc
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset 6, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register 6
	movl	$name, %eax
	andq	$-4096, %rax
	movl	$7, %edx
	movl	$1, %esi
	movq	%rax, %rdi
	call	mprotect
	movl	$.LC0, %edi
	call	puts
	movl	$name, %edi
	call	readString
	movl	$.LC1, %esi
	movl	$name, %edi
	call	strcmp
	testl	%eax, %eax
	jne	.L7
	movb	$66, grade(%rip)
.L7:
	movzbl	grade(%rip), %eax
	movsbl	%al, %eax
	movl	%eax, %esi
	movl	$.LC2, %edi
	movl	$0, %eax
	call	printf
	movl	$name, %esi
	movl	$.LC3, %edi
	movl	$0, %eax
	call	printf
	movl	$0, %eax
	popq	%rbp
	.cfi_def_cfa 7, 8
	ret
	.cfi_endproc
.LFE3:
	.size	main, .-main
	.ident	"GCC: (GNU) 4.8.5 20150623 (Red Hat 4.8.5-16)"
	.section	.note.GNU-stack,"",@progbits
