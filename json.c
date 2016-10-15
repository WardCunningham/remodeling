int main()
{
	int ch;
	int getchar();
	int putchar();
	while ((ch=getchar())>0) {
		if (ch==0263) {
			putchar('<');
			putchar('<');
			putchar('<');
			putchar('<');
			putchar('g');
			putchar('s');
			putchar('>');
			putchar('>');
			putchar('>');
			putchar('>');
		} else {
			putchar(ch);
		}
	}
}