<pre>
<code>```mermaid
flowchart LR
    %% Defining the styles for a clean, non-tech look
    classDef input fill:#d4edda,stroke:#28a745,stroke-width:2px,color:black;
    classDef hidden fill:#fff3cd,stroke:#ffc107,stroke-width:2px,color:black;
    classDef output fill:#cce5ff,stroke:#007bff,stroke-width:2px,color:black;

    subgraph Input ["Step 1: INPUT LAYER (The 9 Clues)"]
        direction TB
        I1["Top-Left Square"]
        I2["Top-Middle Square"]
        I3["...all 9 squares"]
    end

    subgraph Hidden1["Step 2: HIDDEN LAYER 1 (18 Rookie Detectives)"]
        direction TB
        H1_1["Detective 1"]
        H1_2["Detective 2"]
        H1_3["...up to 18"]
    end

    subgraph Hidden2 ["Step 3: HIDDEN LAYER 2 (18 Senior Detectives)"]
        direction TB
        H2_1["Detective 1"]
        H2_2["Detective 2"]
        H2_3["...up to 18"]
    end

    subgraph Output ["Step 4: OUTPUT LAYER (The Final Answer)"]
        direction TB
        O1["Is Square 1 best? (0%)"]
        O2["Is Square 2 best? (0%)"]
        O3["Is Square 3 best? (99%!)"]
    end

    %% Drawing the connections
    I1 & I2 & I3 ---> H1_1 & H1_2 & H1_3
    H1_1 & H1_2 & H1_3 ---> H2_1 & H2_2 & H2_3
    H2_1 & H2_2 & H2_3 ---> O1 & O2 & O3

    %% Applying the colors
    class I1,I2,I3 input;
    class H1_1,H1_2,H1_3,H2_1,H2_2,H2_3 hidden;
    class O1,O2,O3 output;
```</code>
</pre>
