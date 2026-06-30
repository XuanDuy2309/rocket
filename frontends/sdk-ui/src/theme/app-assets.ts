/** Figma MCP asset URLs — refresh from design file if expired (7-day TTL). */
export const appAssets = {
    cameraBg:
        'https://www.figma.com/api/mcp/asset/b60cfd22-fb1c-416a-a828-0845c5454a59',
    cameraAvatar:
        'https://www.figma.com/api/mcp/asset/7adac312-e295-48d8-9b8a-5cbf4e2f1b1d',
    cameraPreview:
        'https://www.figma.com/api/mcp/asset/e3a833d3-2788-4917-9e87-3c3ea0af5cb6',
    feedPhoto:
        'https://www.figma.com/api/mcp/asset/50b07dca-9b63-4798-b29c-0de6a5660cd3',
    memoryUser:
        'https://www.figma.com/api/mcp/asset/c2678d87-a74b-4f31-ae11-de5623e7f518',
    memoryFlashback:
        'https://www.figma.com/api/mcp/asset/abef7da6-a316-46cf-a687-0b361fd74c31',
    profileAvatar:
        'https://www.figma.com/api/mcp/asset/8817c46b-7a98-4eac-a10c-79ab463e66ea',
    friends: {
        julian:
            'https://www.figma.com/api/mcp/asset/9ede3888-9660-47e1-864b-c7f0089bf987',
        sasha:
            'https://www.figma.com/api/mcp/asset/b242ed8b-25f2-4575-8886-3c500b94c32b',
        marcus:
            'https://www.figma.com/api/mcp/asset/3b6ffaec-09d8-4b75-a77e-ec7317233500',
        elena:
            'https://www.figma.com/api/mcp/asset/824d592b-75c2-49b8-b904-04fd84e243aa',
        maya:
            'https://www.figma.com/api/mcp/asset/c71fbc6a-02eb-4289-abe0-618a85929c93',
        chloe:
            'https://www.figma.com/api/mcp/asset/59a80c40-df91-4ac5-8808-7a47a7d7e934',
    },
    memoryCalendar: [
        'https://www.figma.com/api/mcp/asset/b6154fd1-d272-4631-be7f-65af43b6cd9e',
        'https://www.figma.com/api/mcp/asset/427fd628-34a5-4ca3-826b-bbc1f5615325',
        'https://www.figma.com/api/mcp/asset/8e557eb4-b74c-4d64-a793-6d38fadd0deb',
        'https://www.figma.com/api/mcp/asset/7a9017ef-0173-43b0-85da-11b018698cca',
        'https://www.figma.com/api/mcp/asset/abf4261c-c5a4-4aca-a5e8-50dc022fb3b2',
        'https://www.figma.com/api/mcp/asset/73abd8fc-1700-43df-be69-d5bf50c03039',
        'https://www.figma.com/api/mcp/asset/7a0c1269-56b5-4b90-bfd4-f3d6522046ed',
    ],
} as const;

export type AppNavTab = 'grid' | 'chat' | 'home' | 'memory';
