import * as React from 'react';
import { IOrganism } from 'src/models/Organism';
import { observer } from 'mobx-react';

declare var GeniBlocks: any;
var GenomeView = GeniBlocks.GenomeView;

interface GenomeProps {
  org: IOrganism;
  editable: boolean;
}

@observer
class Genome extends React.Component<GenomeProps> {
  constructor(props: any) {
    super(props);

    this.handleAlleleChange = this.handleAlleleChange.bind(this);
  }

  handleAlleleChange(chromosomeName: string, side: string, prevAllele: string, newAllele: string) {
    var actualNewAllele = prevAllele === 'B' ? 'b' : 'B';
    let bioOrganism = this.props.org.getBiologicaOrganism();
    bioOrganism.genetics.genotype.replaceAlleleChromName(chromosomeName, side, prevAllele, actualNewAllele);
    console.log(bioOrganism.getAlleleString());
    this.props.org.setAlleles(bioOrganism.getAlleleString());
  }

  render() {
    let bioOrganism = this.props.org.getBiologicaOrganism();
    return (
      <GenomeView
        org={bioOrganism}
        userChangeableGenes={['brown']}
        small={true}
        editable={this.props.editable}
        onAlleleChange={this.handleAlleleChange}
      />
    );
  }
}

export default Genome;