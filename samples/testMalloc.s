	.section ".rodata"
invalid:
	.string "usage: testMalloc nbytes\n"

	.text
	.globl main
	.type main,@function

main:
	pushq	%rbp
	movq 	%rsp, %rbp
	subq	$8, %rsp
	cmpq	$2, %rdi
	jz 		noerror
	movq 	$invalid, %rdi
	call	printf
	movabsq	$1, %rdi
	call 	exit
noerror:	
	movq 	8(%rsi), %rdi
	call 	atoi
	movq 	%rax, %rdi
	call 	malloc
	movq	%rdi, %rcx
	movq	%rax, -8(%rbp)
	movb	$0, %bl
startloop:
	jecxz	endloop
	movb	%bl, (%rax)
	incb	%bl
	incq	%rax
	decq	%rcx
	jmp		startloop
endloop:
	movq	-8(%rbp), %rdi
	call	free
	movq	%rbp, %rsp
	popq	%rbp
	ret