export class DialogueManager {
    witch: any;
}

class NpcDialogue {
    name: string;
    currentNode: DialogueNode;

    activate(): void {}
}

class DialogueNode {
    dialogue: string[];
    options: DialogueNode[];
}
