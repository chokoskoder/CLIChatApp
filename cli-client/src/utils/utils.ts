export function str2ab(str : string) :  ArrayBuffer{
	return new TextEncoder().encode(str);	
}

export function ab2str(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

//now why is that we need to convert strings to ArrayBuffer specifically ? because ArrayBuffer is used to represent generic raw binary data buffer
//which is an array of bytes 
