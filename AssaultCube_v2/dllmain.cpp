// dllmain.cpp : Defines the entry point for the DLL application.
#define WIN32_LEAN_AND_MEAN             // Exclude rarely-used stuff from Windows headers
// Windows Header Files
#include <windows.h>
#include <iostream>

FILE* console_stream;

BOOL APIENTRY DllMain( HMODULE hModule,
                       DWORD  ul_reason_for_call,
                       LPVOID lpReserved
                     )
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        AllocConsole();
        freopen_s(&console_stream, "CONOUT$", "w", stdout);
        std::cout << "Hello, Welcome back.\n";

        while (!GetAsyncKeyState(VK_END)) {}
        
        if (console_stream) {
            fclose(console_stream);
            FreeConsole();
        }
        break;
    }
    return TRUE;
}

